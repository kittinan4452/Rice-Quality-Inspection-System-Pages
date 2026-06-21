import json
from celery import shared_task


@shared_task(bind=True)
def run_inspection(self, upload_path, date, name, register, member, type_rice, user_first_name, username, user_id=None):
    from .predict2 import predict2
    from .models import Dataperson, Data_size, Data_type

    size_json, type_json = predict2(upload_path, date)
    data_size = json.loads(size_json)
    data_type = json.loads(type_json)

    person = Dataperson.objects.create(
        name=name,
        register=register,
        member=member,
        type_rice=type_rice,
        image=f'upload/{date}.jpg',
        owner_id=user_id,
        user_name=user_first_name,
        username=username,
    )
    Data_size.objects.create(
        resultall_G=data_size['resultall_G'],
        resultall_B=data_size['resultall_B'],
        totalall=data_size['totalall'],
        resultall_b1=data_size['resultall_b1'],
        resultall_b2=data_size['resultall_b2'],
        resultall_b3=data_size['resultall_b3'],
        average_h=data_size['average_h'],
        average_w=data_size['average_w'],
    )
    Data_type.objects.create(
        resultall_percent_G=data_type['resultall_percent_G'],
        resultall_percent_C=data_type['resultall_percent_C'],
        resultall_percent_B=data_type['resultall_percent_B'],
        resultall_percent_Y=data_type['resultall_percent_Y'],
        resultall_percent_D=data_type['resultall_percent_D'],
        image1=data_type['image_1'],
        image2=data_type['image_2'],
        image3=data_type['image_3'],
        image4=data_type['image_4'],
        image5=data_type['image_5'],
    )
    return person.id
