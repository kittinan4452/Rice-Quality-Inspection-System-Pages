from rest_framework import serializers
from django.conf import settings
from .models import Dataperson, Data_size, Data_type


class InspectionListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Dataperson
        fields = ['id', 'name', 'register', 'member', 'type_rice', 'date']


class DataSizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Data_size
        fields = [
            'resultall_G', 'resultall_B', 'totalall',
            'resultall_b1', 'resultall_b2', 'resultall_b3',
            'average_h', 'average_w',
        ]


class DataTypeSerializer(serializers.ModelSerializer):
    image1_url = serializers.SerializerMethodField()
    image2_url = serializers.SerializerMethodField()
    image3_url = serializers.SerializerMethodField()
    image4_url = serializers.SerializerMethodField()
    image5_url = serializers.SerializerMethodField()

    class Meta:
        model = Data_type
        fields = [
            'resultall_percent_G', 'resultall_percent_C', 'resultall_percent_B',
            'resultall_percent_Y', 'resultall_percent_D',
            'image1_url', 'image2_url', 'image3_url', 'image4_url', 'image5_url',
        ]

    def _image_url(self, path):
        request = self.context.get('request')
        if not path:
            return None
        url = settings.MEDIA_URL + str(path)
        return request.build_absolute_uri(url) if request else url

    def get_image1_url(self, obj): return self._image_url(obj.image1)
    def get_image2_url(self, obj): return self._image_url(obj.image2)
    def get_image3_url(self, obj): return self._image_url(obj.image3)
    def get_image4_url(self, obj): return self._image_url(obj.image4)
    def get_image5_url(self, obj): return self._image_url(obj.image5)


class InspectionDetailSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()
    size = serializers.SerializerMethodField()
    type_data = serializers.SerializerMethodField()

    class Meta:
        model = Dataperson
        fields = ['id', 'name', 'register', 'member', 'type_rice', 'user_name', 'date', 'image_url', 'size', 'type_data']

    def get_image_url(self, obj):
        request = self.context.get('request')
        if not obj.image:
            return None
        url = settings.MEDIA_URL + str(obj.image)
        return request.build_absolute_uri(url) if request else url

    def get_size(self, obj):
        try:
            return DataSizeSerializer(Data_size.objects.get(id=obj.id)).data
        except Data_size.DoesNotExist:
            return None

    def get_type_data(self, obj):
        try:
            return DataTypeSerializer(
                Data_type.objects.get(id=obj.id),
                context=self.context
            ).data
        except Data_type.DoesNotExist:
            return None
