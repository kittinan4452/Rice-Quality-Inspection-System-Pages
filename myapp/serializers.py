from rest_framework import serializers
from .models import Dataperson, Datauser, Data_size, Data_type
from django.contrib.auth.models import User


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']
        extra_kwargs = {
            'password': {'write_only': True}
        }


class DatauserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Datauser
        fields = '__all__'


class DatapersonSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = Dataperson
        fields = ['id', 'name', 'register', 'member', 'type_rice', 'date',
                  'user_name', 'username', 'image', 'image_url']

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get('request')
            if request:
                # Handle absolute paths stored in database
                image_path = obj.image.name
                if image_path.startswith('myapp/'):
                    image_path = image_path[7:]  # Remove 'myapp/' prefix
                return request.build_absolute_uri(f'/media/{image_path}')
            return obj.image.url
        return None


class Data_sizeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Data_size
        fields = '__all__'


class Data_typeSerializer(serializers.ModelSerializer):
    image1_url = serializers.SerializerMethodField()
    image2_url = serializers.SerializerMethodField()
    image3_url = serializers.SerializerMethodField()
    image4_url = serializers.SerializerMethodField()
    image5_url = serializers.SerializerMethodField()

    class Meta:
        model = Data_type
        fields = ['id', 'resultall_percent_G', 'resultall_percent_C',
                  'resultall_percent_B', 'resultall_percent_Y',
                  'resultall_percent_D', 'image1', 'image2', 'image3',
                  'image4', 'image5', 'image1_url', 'image2_url',
                  'image3_url', 'image4_url', 'image5_url', 'date_type']

    def _get_image_url(self, obj, image_field):
        image = getattr(obj, image_field)
        if image:
            request = self.context.get('request')
            if request:
                image_path = image.name
                if image_path.startswith('myapp/'):
                    image_path = image_path[7:]  # Remove 'myapp/' prefix
                return request.build_absolute_uri(f'/media/{image_path}')
            return image.url
        return None

    def get_image1_url(self, obj):
        return self._get_image_url(obj, 'image1')

    def get_image2_url(self, obj):
        return self._get_image_url(obj, 'image2')

    def get_image3_url(self, obj):
        return self._get_image_url(obj, 'image3')

    def get_image4_url(self, obj):
        return self._get_image_url(obj, 'image4')

    def get_image5_url(self, obj):
        return self._get_image_url(obj, 'image5')


# Combined serializers for API responses
class RiceInspectionDetailSerializer(serializers.Serializer):
    """Combined serializer for full rice inspection data"""
    person = DatapersonSerializer()
    data_size = Data_sizeSerializer()
    data_type = Data_typeSerializer()


class RiceInspectionCreateSerializer(serializers.Serializer):
    """Serializer for creating new rice inspection"""
    name = serializers.CharField(max_length=100)
    register = serializers.CharField(max_length=100)
    member = serializers.CharField(max_length=100)
    type_rice = serializers.CharField(max_length=100)
    user_name = serializers.CharField(max_length=100)
    image = serializers.ImageField()


class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)


class RegisterSerializer(serializers.Serializer):
    firstname = serializers.CharField(max_length=100)
    lastname = serializers.CharField(max_length=100)
    username = serializers.CharField(max_length=50)
    password = serializers.CharField(max_length=100, write_only=True)
    email = serializers.EmailField()
