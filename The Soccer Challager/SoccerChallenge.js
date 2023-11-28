import {defs, tiny} from './examples/common.js';
import {Body, Simulation, Test_Data} from './examples/collisions-demo.js';
import {objs} from './models.js';
//import { Simulation } from './examples/control-demo.js';
const {
    Vector, Vector3, vec, vec3, vec4, color, hex_color, Shader, Matrix, Mat4, Light, Shape, Material, Scene, Texture,
} = tiny;
const { Triangle, Square, Tetrahedron, Torus, Windmill, Cube, Subdivision_Sphere, Cylindrical_Tube, Textured_Phong, Capped_Cylinder, Rounded_Closed_Cone, Textured_Phong_text, Phong_Shader, Regular_2D_Polygon, Closed_Cone } = defs;
const {SceneGraph, HumanFigure, soccerNet, Block1, Block2, Chick, Chicken, BoundingBox, Soccer_ball, Flower, SoccerFieldBoundary, Arrow} = objs



export class Main extends Simulation {
    /**
     *  **Base_scene** is a Scene that can be added to any display canvas.
     *  Setup the shapes, materials, camera, and lighting here.
     */
    constructor() {
        super();
        
        this.materials = {
            phong: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .52, diffusivity: .1, specularity: 0.1,
                texture: new Texture("assets/blue.png")
            }),
            block2: new Material(new Textured_Phong(), {
                color: hex_color("#ff745e"),
                ambient: .6, diffusivity: .1, specularity: 0.5,
                texture: new Texture("assets/block.jpg")
            }),
            
            net: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: .5, diffusivity: .1, specularity: 0.1,
                texture: new Texture("assets/net21.png")
            }),
            sky: new Material(new Textured_Phong(), {
                color: hex_color("#A1B8D6"),
                ambient: .5, diffusivity:.1, specularity: 0.1,
                texture: new Texture("assets/sky2.png"),
            }),
            blank: new Material(new Textured_Phong(), {
                color: hex_color("#edef00"),
                ambient: .5, diffusivity: 1, specularity: .1,
                texture: new Texture("assets/white.jpeg")
            }),
            ball_skin: new Material(new Textured_Phong(), {
                color: hex_color("#ffffff"),
                ambient: 0.48, diffusivity: 0, specularity: 0,
                texture: new Texture("assets/ball.png")
            }),
            grass: new Material(new Textured_Phong(), {
                color: hex_color("#00FF00"), // 绿色草地
                ambient: 0.4, diffusivity: 0.5, specularity: 0.1,
                texture: new Texture("assets/grass.jpg", "LINEAR")

            }),
            boundary_material: new Material(new Textured_Phong(),
            {   ambient: 1, 
                color: color(1, 1, 1, 1)
            
            }),
            arrow_skin: new Material(new defs.Phong_Shader(),
            {ambient: 1, diffusivity: 0, specularity: 0, color: hex_color("#B4213A")}),
 
        }
        this.shapes = {
            tube: new Cylindrical_Tube(1, 20),
            flower: new Flower(this.materials.blank, Mat4.identity()),
            human: new HumanFigure(this.materials.phong, Mat4.scale(.8, .8, .8).times(Mat4.translation(0, 1.875, 0))),
            ///1.4/.8
            net: new soccerNet(this.materials.net, Mat4.translation(0, 3, -30).times(Mat4.rotation(Math.PI, 0, 1, 0))),
            poly: new Regular_2D_Polygon(4, 2),
            box: new Cube(),
            sphere: new Subdivision_Sphere(4),
            block: new Block1(this.materials.phong, Mat4.identity()),
            chick: new Chick(this.materials.blank, Mat4.translation(0, 0, 0)),
            chicken:new Chicken(this.materials.blank, Mat4.translation(0 ,1.8, 0)),
            block2: new Block2(this.materials.block2, Mat4.identity().times(Mat4.translation(0, 0, 0))),
            // ground: new Regular_2D_Polygon(100,100),
            // soccer field
            field: new Regular_2D_Polygon(100, 100), // 4个顶点，1表示矩形
            ball: new Soccer_ball(this.materials.ball_skin, Mat4.scale(0.7, 0.7, 0.7)),
            field_boundary: new SoccerFieldBoundary(this.materials.boundary_material, Mat4.identity()),
            arrow: new Arrow(this.materials.arrow_skin, Mat4.identity())

        }
        
        this.shapes.field.bound = new BoundingBox(0,0,0,100,1,100);
        this.backgroundMusic = new Audio('music/background_music.mp3');
        this.backgroundMusic.loop = true;
        
        this.flower_trans1 =Mat4.translation(15, .1, -12)
        this.flower_trans2 = Mat4.translation(5, .1, 18) 
        this.flower_trans3 = Mat4.translation(-12, .1, -2)
        this.flower_trans4 = Mat4.translation(-6, .1, 7)
        this.flower_trans5 = Mat4.translation(-3, .1, 25)

        //human movement
        this.moving = false
        this.forward = false
        this.back = false
        this.left = false
        this.right = false
        this.collision = false
        this.agent_pos = vec3(0, -.25, 30)
        this.face = "forward" 
        this.agent_trans = Mat4.identity() // store the character's translation value
        this.agent_rot = vec4(0,0,0,0)   // store the character's rotation state 
        this.agent_size = 0.8      // scale

        // ball related
        this.ball_pos = vec3(0,0.7,29)  
        this.direction = 1
        this.kick = false
        this.time = 0
        this.get_goal = false
        this.ball_out = false
        this.movement_face
        //this.spin_angle = Math.PI
        this.linear_velocity_yz = vec3(0,0,0)
        this.ball_collision = false
        this.kick_angle_hon = 0
        this.varying_angle = 0
        //this.kick_angle_hon = Math.PI/8
        this.incre = false
        this.touching_ball_time = 0
        


        //perspectives
        this.initial_camera_location = Mat4.look_at(vec3(-15, 8, 40), vec3(5, 0, 0), vec3(0, 5, 0));
        this.first = false
        this.second = false
        this.third = false
        this.initial = false
        
        //把所有需要碰撞检测的东西（除了移动的主体以外放进这个列表里）
        
        //初始化障碍物位置，球网位置固定，鸡群只刷一只
        this.still_items = [this.shapes.net, this.shapes.chicken]
        //随机刷新的障碍物的种类
        this.types = ["block1", "chick", "block2"]
        //可调整： 随机生成障碍物的位置
        this.areas = [[Math.random() * (-11+21) -21, Math.random() * (20-10) +10], 
                        [Math.random() * (-11+21) -21, Math.random() * (-10+20) -20],
                        [Math.random() * (-11+21) -21, Math.random() * (5+5) -5], 
                        [Math.random() * (5+5) -5, Math.random() * (20-10) +10],
                        [Math.random() * (5+5) -5, Math.random() * (-10+20) - 20],
                        [Math.random() * (5+5) -5, Math.random() * (5+5) -5],
                        [Math.random() * (21-11) +11, Math.random() * (20-10) +10], 
                        [Math.random() * (21-11) +11, Math.random() * (-10+20) - 20],
                        [Math.random() * (21-11) +11, Math.random() * (5+5) -5]]
        //随机鸡群位置
        let random = Math.floor(Math.random() * (5-0) + 0)
        this.chicken_pos = this.areas[random]

        //必须保证鸡群刷新位置在bound最左侧，不然会发生障碍物之间的碰撞
        let counter = this.chicken_pos[0]
        if (counter <= -11) {counter = -21}
        else if (counter <= 5) {counter = -5}
        else {counter = 11}
        this.shapes.chicken.model_transform = this.shapes.chicken.model_transform.times(Mat4.translation(counter, 0, this.chicken_pos[1])) 
        for (let i = 0; i < this.shapes.field.arrays.texture_coord.length; ++i) {
            this.shapes.field.arrays.texture_coord[i].scale_by(12)
        } 
        //位置列表中去除鸡群位置
        this.areas.splice(random, 1)

        this.boundings = [new BoundingBox(this.areas[0][0], 0, this.areas[0][1], 0, 0, 0),
        new BoundingBox(this.areas[1][0], 0, this.areas[1][1], 0, 0, 0),
        new BoundingBox(this.areas[2][0], 0, this.areas[2][1], 0, 0, 0),
        new BoundingBox(this.areas[3][0], 0, this.areas[3][1], 0, 0, 0),
        new BoundingBox(this.areas[4][0], 0, this.areas[4][1], 0, 0, 0),
        new BoundingBox(this.areas[5][0], 0, this.areas[5][1], 0, 0, 0),
        new BoundingBox(this.areas[6][0], 0, this.areas[6][1], 0, 0, 0),
        new BoundingBox(this.areas[7][0], 0, this.areas[7][1], 0, 0, 0)]


        

        this.length = 10
        this.temp = this.length
        this.chicken_direction = true
    
        //random_refresh: 填充this.still_items 列表，随机位置，随机物件
        let num = 0
        for (let i of this.areas) {
            this.random_refresh(i, num)
            num++
        }
        
    }

 

    make_control_panel() {
        // "m" to controal the background_music
        this.key_triggered_button("Toggle Music", ["m"], () => {
            this.toggleMusic();
        });

        this.key_triggered_button("Follow Human", ["Control", "1"], () => {
            this.first = true
            this.second = false
            this.third = false
        });

        this.key_triggered_button("Camera from Left", ["Control", "2"], () => {
            this.first = false
            this.second = true
            this.third = false
        });
        this.key_triggered_button("Camera from Right", ["Control", "3"], () => {
            this.first = false
            this.second = false
            this.third = true
        });


        this.key_triggered_button("Initial Perspective", ["Control", "4"], () => {
            this.first = false
            this.second = false
            this.third = false
            this.initial = true
        });
        this.key_triggered_button("Restart", ["r"], () => {

            this.restart()
  
        });
        
        this.key_triggered_button("Move Forward", ["ArrowUp"], () => {
            this.moving = true
            this.forward = true 
            
        }, undefined, () => {
            this.moving = false
            this.forward = false
        });

        

        // Move backward
        this.key_triggered_button("Move Backward", ["ArrowDown"], () => {
            this.moving = true
            this.back = true
  


        }, undefined, () => {
            this.moving = false
            this.back = false
        });

        this.key_triggered_button("Move Left", ["ArrowLeft"], () => {
            this.moving = true
            this.left = true

        }, undefined, () => {
            this.moving = false
            this.left = false
        });

        this.key_triggered_button("Move Right", ["ArrowRight"], () => {
            this.moving = true
            this.right = true

        }, undefined, () => {
            this.moving = false
            this.right = false
        });

        this.key_triggered_button("Kick", ["k"], () =>{
            if (this.shapes.human.bound.close (this.shapes.ball.bound)) {
                this.kick = true
                this.time = 0
            }
        })

    }

    // For key_triggered_button 'm' controal music
    playMusic() {
        this.backgroundMusic.play().catch(e => console.error("Error playing music:", e));
    }
    pauseMusic() {
        this.backgroundMusic.pause();
    }
    toggleMusic() {
        if (this.backgroundMusic.paused) {
            this.playMusic();
        } else {
            this.pauseMusic();
        }
    }
    restart() {
        caches.delete()
        location.reload()
    }

    // For stopping human after an obstacle collision
    stop_human_figure() {
        this.moving = false
        this.shapes.human.stop_swin()
    }
    
    //random_refresh: refresh the blocks in the given area
    random_refresh(area, num, type=this.types[Math.floor(Math.random()*this.types.length)]) {
        if (type == "block1") {
        this.still_items.push(this.shapes.block)
    
        this.boundings[num].x = area[0]

        this.boundings[num].z = area[1]
        this.boundings[num].y = 6*.7*.5
        this.boundings[num].width = 9.2*.7
        this.boundings[num].height = 6*.7
        this.boundings[num].depth = .2*.7
    //console.log(this.boundings[num].w, this.boundings[num].h, this.boundings[num].d)
}
        else if (type == "chick") {
        this.still_items.push(this.shapes.chick)
        this.boundings[num].x = area[0]
        this.boundings[num].z = area[1]
        this.boundings[num].y = 1.8
        this.boundings[num].width = 1.2
        this.boundings[num].height = 3.6
        this.boundings[num].depth = 3
        //console.log(this.boundings[num].w, this.boundings[num].h, this.boundings[num].d)
    }
        else if (type == "block2") {
        this.still_items.push(this.shapes.block2)
        this.boundings[num].x = area[0]
        this.boundings[num].z = area[1]
        this.boundings[num].y = .85
        this.boundings[num].width = 1
        this.boundings[num].height = 1.5
        this.boundings[num].depth = 1}
 
        
    }

    //鸡群移动，length = 10
    move_chicken(chicken, dt=this.dt) {
        let speed = 10
        let temp = dt*speed
            chicken.update_pos()
            chicken.update_bound()
            chicken.wobble(this.t, this.direction)
            
            if (this.chicken_direction) {
            chicken.model_transform[0][3] = chicken.model_transform[0][3] + temp
            }
            
            else {
                chicken.model_transform[0][3] = chicken.model_transform[0][3] - temp}

            return temp
    

    }

    
    kicking_ball(ball, dt=this.dt) {
        let kick_angle = -Math.sin(this.kick_angle_hon)/10 
        if(this.movement_face == "left" || this.movement_face == "right")
        kick_angle = Math.cos(this.kick_angle_hon)/10 
        //let prev_pos = this.ball_pos
        //console.log("kick on")
        //console.log(this.ball_pos[1])
        
        if(this.time == 0)
            this.movement_face = this.face; // prevent the angle change while the movement
        if(this.movement_face == "forward")
        {
            if (this.ball_collision) {
                // linear_velocity_yz is a velocity vector that has magnitude and direction in every this.time unit(like real time)
                this.linear_velocity_yz[2] = (8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle
                // point + vector = movement
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
            else{
                this.linear_velocity_yz[2] = -(8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }else if(this.movement_face == "backward")
        {
            if (this.ball_collision) {
                this.linear_velocity_yz[2] = -(8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle

                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
            else{
                this.linear_velocity_yz[2] = (8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[0] = kick_angle
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }else if(this.movement_face == "left")
        {
            if (this.ball_collision) {
                this.linear_velocity_yz[0] = (8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = -kick_angle

                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
            else{
                this.linear_velocity_yz[0] = -(8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = -kick_angle
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }else if(this.movement_face == "right")
        {
            if (this.ball_collision) {
                this.linear_velocity_yz[0] = -(8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = -kick_angle

                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);           
            }
            else{
                this.linear_velocity_yz[0] = (8*(this.time/1000) - .98*(this.time/100)*(this.time/100))
                this.linear_velocity_yz[1] = 4*(this.time/1000) - .98*(this.time/100)*(this.time/100)
                this.linear_velocity_yz[2] = -kick_angle
                this.ball_pos = this.ball_pos.plus(this.linear_velocity_yz);
            }
        }
        
        // spinning, from ethan
        let rotation_angle = this.linear_velocity_yz.norm() / .8 * this.time;
        ball.model_transform = ball.model_transform.times(Mat4.rotation(rotation_angle,1,0,0))
        console.log(kick_angle)
         ++this.time;
        
        // stop kick condition
        if(this.ball_pos[1]<0.68)
        {
            this.kick = false;
            this.ball_collision = false;
            
            //console.log("kick off")
            // correct ball's position
            this.ball_pos[1] = .699
            //console.log(this.ball_pos[1])
        }
            
    }
    set_camera_init(program_state) {
        //console.log(3)
        program_state.camera_inverse = Mat4.rotation(Math.PI/10, 1, 0, 0).times(Mat4.translation(-this.agent_pos[0],this.agent_pos[1] - 8,-this.agent_pos[2] - 12)).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1))
        
    }

    check_goal()
    {// check passing through the imagine goal
        if((this.ball_pos[0] >= -4.6 || this.ball_pos[0] <= 5.2) &&  // -4.6 < x < 5.2
           (this.ball_pos[1] >= .9 || this.ball_pos[1] <= 4.7) &&    // 0.9 < y < 4.7
           (this.ball_pos[2] <= -26.4) )                             //       z < -26.4
                this.get_goal = true;
            //console.log(this.get_goal)
    }

    check_out_of_bound()
    {// check passing through the boundary
        if((this.ball_pos[0] <= -28 || this.ball_pos[0] >= 29) ||  // -28 < x < 29
           (this.ball_pos[2] <= -25 || this.ball_pos[2] >= 38) )     // -25 < z < 38                
                this.ball_out = true;
            //console.log(this.ball_out)
        
        // respawn human and ball
        if(this.ball_out)
        {
            this.ball_pos = vec3(0,0.7,29);
            this.agent_pos = vec3(0, -.25, 30);
            if(this.face == "backward")
                this.agent_rot[0] -= Math.PI;
            else if(this.face == "left")
                this.agent_rot[0] -= Math.PI/2;
            else if(this.face == "right")
                this.agent_rot[0] += Math.PI/2;
              
            this.ball_out = false;
            this.kick = false;
            this.face = "forward";
        }
    }

    check_human_boundary()
    {
        if(this.agent_pos[0] <= -30)
            this.agent_pos[0] += 0.2
        else if(this.agent_pos[0] >= 31)
            this.agent_pos[0] -= 0.2
        else if(this.agent_pos[2] <= -27)
            this.agent_pos[2] += 0.2
        else if(this.agent_pos[2] >= 40)
            this.agent_pos[2] -= 0.2
    }

    drawing_arrow(arrow, dt = this.dt)
    {

        

        
                
        //  if(this.face == "left")
        //         this.kick_angle_hon += Math.PI/2;
        // else if(this.face == "right")
        //         this.kick_angle_hon -= Math.PI/2;

        // if(this.touching_ball_time == 0)
        // {
        //     if(this.face == "backward")
        //         this.kick_angle_hon -= Math.PI;
        //     else if(this.face == "left")
        //         this.kick_angle_hon += Math.PI/2;
        //     else if(this.face == "right")
        //         this.kick_angle_hon -= Math.PI/2;
        // }

        if(!this.kick)
        {

            if(this.face == "backward")
            {
                if(this.touching_ball_time == 0)
                    this.varying_angle -= Math.PI;
                if(this.varying_angle >= (Math.PI/4 - Math.PI))
                    this.incre = true
                else if(this.varying_angle <= (-Math.PI/4 - Math.PI))
                    this.incre = false
            }
            else if(this.face == "left")
            {
                if(this.touching_ball_time == 0)
                    this.varying_angle += Math.PI/2;
                if(this.varying_angle >= (Math.PI/4 + Math.PI/2))
                    this.incre = true
                else if(this.varying_angle <= (-Math.PI/4 + Math.PI/2))
                    this.incre = false
            }
            else if(this.face == "right")
            {
                if(this.touching_ball_time == 0)
                    this.varying_angle -= Math.PI/2;
                if(this.varying_angle >= (Math.PI/4 - Math.PI/2))
                    this.incre = true
                else if(this.varying_angle <= (-Math.PI/4 - Math.PI/2))
                    this.incre = false
            }
            else{
                if(this.varying_angle >= Math.PI/4)
                    this.incre = true
                else if(this.varying_angle <= -Math.PI/4)
                    this.incre = false
            }
            

            if(!this.incre)
                this.varying_angle += Math.PI/180 * dt*40
            else
                this.varying_angle -= Math.PI/180 * dt*40
            
           
                this.kick_angle_hon = this.varying_angle;
                console.log(this.varying_angle)
                ++this.touching_ball_time
        }
        
        
        arrow.model_transform = Mat4.translation(this.agent_pos[0], this.agent_pos[1] + 5, this.agent_pos[2]-2)
                                    .times(Mat4.rotation(this.varying_angle,0,1,0))
                                    .times(Mat4.rotation(Math.PI/16,1,0,0))
        
        
    }

    display(context, program_state) {
        if (!context.scratchpad.controls) {
            this.children.push(context.scratchpad.controls = new defs.Movement_Controls());
            program_state.set_camera(Mat4.translation(-3, -5, -45).times(Mat4.rotation(Math.PI/6,0,1,0)));
        }

        

        program_state.projection_transform = Mat4.perspective(
            Math.PI / 4, context.width / context.height, 1, 1000);

        const light_position = vec4(10, 10, 10, 1);
        program_state.lights = [new Light(light_position, color(1, 1, 1, 1), 1000)];

        this.t = program_state.animation_time / 1000;
        this.dt = program_state.animation_delta_time / 1000;
        
    
        let speed = 10.0
        this.check_human_boundary()
        if (this.moving && ! this.collision) { 
            let speed = 10.0;
            this.shapes.human.swingArm(program_state.animation_time / 300)  // Changing the swing time
            this.shapes.human.swingLeg(program_state.animation_time / 300)
            if (this.forward) {
                if(this.face != "forward")
                {
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}  //Rotate 90° to the left
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;} //Rotate 90° to the right
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;} //Rotate 180° to the backward
                
                    this.face = "forward";
                }
                this.agent_pos[2] -= this.dt * speed;  // Decrease the human's Z-axis value
               
    
            }
            if (this.back) {
                
                if(this.face != "backward")
                {
                    
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;}
                    
                    this.face = "backward";
                }
                this.agent_pos[2] += this.dt * speed;
              
            }
            if (this.left) {
                
                if(this.face != "left")
                {
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    if (this.face == "right") {this.agent_rot[0] = this.agent_rot[0] - Math.PI;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
    
                    this.face = "left";
                }
                this.agent_pos[0] -= this.dt * speed;
                
            }
            if (this.right) {
                
                if(this.face != "right")
                {
                   
                    if (this.face == "backward") {this.agent_rot[0] = this.agent_rot[0] + Math.PI/2;}
                    if (this.face == "left") {this.agent_rot[0] = this.agent_rot[0] + Math.PI;}
                    if (this.face == "forward") {this.agent_rot[0] = this.agent_rot[0] - Math.PI/2;}
                    
                    this.face = "right";
                }
                this.agent_pos[0] += this.dt * speed;
                
            }
        
        }else if (this.collision) {
            //.2 is used to fine-tune the position of the character in the event of a collision, 
            //so that it can "move back" or "move away" from the colliding object slightly.
            if (this.face == "forward"){this.agent_pos[2] += .2} 
            if (this.face == "backward") {this.agent_pos[2] -= .2}
            if (this.face == "left") {this.agent_pos[0] += .2}
            if (this.face == "right") {this.agent_pos[0] -= .2}

            this.stop_human_figure()  // let move = false
            
        }
        else if (this.kick) {this.shapes.human.swingLeft(this.t)}
        else{this.stop_human_figure()}

            // 
            this.agent_trans = Mat4.translation(this.agent_pos[0], this.agent_pos[1], this.agent_pos[2]).times(Mat4.rotation(this.agent_rot[0],0,1,0)).
                times(Mat4.scale(this.agent_size,this.agent_size,this.agent_size));
    
            //Synchronizes the center position of a character model with its actual position in world space.
            this.shapes.human.center_x[0] = this.agent_pos[0]
            this.shapes.human.center_x[1] = this.agent_pos[1]
            this.shapes.human.center_x[2] = this.agent_pos[2]
            this.shapes.human.update_bound()

            this.shapes.human.draw(context, program_state, this.agent_trans)

        let touch = false
        if(this.shapes.human.bound.close (this.shapes.ball.bound))
        {
            this.drawing_arrow(this.shapes.arrow)
            this.shapes.arrow.draw(context, program_state)
            touch = true
            
        }
        
        if(!touch)
        {
            this.touching_ball_time = 0;
            this.incre = false
            this.varying_angle = 0;
        }
            
            

            const check = (element) => this.shapes.human.bound.intersects(element) == true
            const check2 = (element) => this.shapes.ball.bound.intersects(element) == true

        //human collision check
        if (this.boundings.some(check) || this.shapes.human.bound.intersects (this.shapes.ball.bound) || 
        this.shapes.human.bound.intersects (this.still_items[0].bound) || this.shapes.human.bound.intersects (this.still_items[1].bound)) {
            this.collision = true
            
        }
        else {
            this.collision = false
        }

        //ball collision check
        if (this.boundings.some(check2)|| 
        this.shapes.ball.bound.intersects (this.still_items[0].bound) || this.shapes.ball.bound.intersects (this.still_items[1].bound)&&this.kick) {

            this.ball_collision = true
            //console.log("oddd")
            //this.kick=false
        } 
        else if (this.shapes.field.bound.intersects2(this.shapes.ball.bound)) {
            //this.ball_collision = true
            
        }
        else {
            if(!this.kick)
            this.ball_collision = false
        }


        /* if (this.ball_pos[1] == 0) {this.kick = false
        this.ball_collision = true} */
        //if(this.kick ) {this.ball_collision = false}


    
        let field_transform = Mat4.identity()
                        .times(Mat4.rotation(Math.PI/2, 1, 0, 0)) // Rotate to lay it flat
                        .times(Mat4.scale(80, 80, 80)); // Scale to the size of a soccer field
        this.shapes.field.draw(context, program_state, field_transform, this.materials.grass.override({color:hex_color("99ff66")}));
        this.shapes.field_boundary.draw(context, program_state, Mat4.identity())
        
        // box 是表示四周的环境，我们可以改成其他的景色
        this.shapes.sphere.draw(context, program_state, Mat4.identity().times(Mat4.rotation(Math.PI/1.5, 0,1,0)).times(Mat4.scale(80, 80, 80)), this.materials.sky)

        
        if(this.kick)
            this.kicking_ball(this.shapes.ball)
        // Drawing ball
        let ball_model_transform = Mat4.translation(this.ball_pos[0], this.ball_pos[1], this.ball_pos[2])
        //console.log(this.ball_pos)
                                                    
        this.shapes.ball.center_x[0] = this.ball_pos[0]
        this.shapes.ball.center_x[1] = this.ball_pos[1]
        this.shapes.ball.center_x[2] = this.ball_pos[2]
        this.shapes.ball.update_bound()
        this.shapes.ball.draw(context, program_state, ball_model_transform)
        
        
        
        //移动鸡，到距离转方向转面
        this.temp -= this.move_chicken(this.shapes.chicken)
        if (this.temp <= 0) {
            this.chicken_direction = !this.chicken_direction
            this.direction = - this.direction
            this.shapes.chicken.model_transform = this.shapes.chicken.model_transform.times(Mat4.rotation(Math.PI, 0, 1, 0))
            this.temp = this.length
        }
        this.check_goal()
        // only check the bound when not getting
        if(!this.get_goal)
            this.check_out_of_bound()
        
        //视角转换， this.first == true: 第一人称
        if(this.first) {this.set_camera_init(program_state)}
        else if (!this.second && !this.third&&!this.initial) {
            //console.log(this.agent_trans)
            setTimeout(() => this.set_camera_init(program_state), 2000);
        

        }
        else if (this.second) {
            program_state.camera_inverse = Mat4.rotation(Math.PI/2, 0, 1, 0).times(Mat4.rotation(Math.PI/12, 0, 0, 1)).times(Mat4.translation(45, -12, 0))
        }
        else if (this.third) {
            program_state.camera_inverse = Mat4.rotation(-Math.PI/2, 0, 1, 0).times(Mat4.rotation(-Math.PI/12, 0, 0, 1)).times(Mat4.translation(-45, -12, 0))
        }
        else if (this.initial) {program_state.set_camera(this.initial_camera_location)}
        //else {program_state.set_camera(Mat4.translation(-3, -5, -45).times(Mat4.rotation(Math.PI/6,0,1,0)).map((x,i) => Vector.from(program_state.camera_inverse[i]).mix(x, 0.1)))}

        //画障碍物
        let num = 1
        for (let i = 0; i < this.still_items.length; i++) {
            if (i < 2) {
            this.still_items[i].draw(context, program_state, Mat4.identity(), this.materials.phong)
            }
            else {
                this.still_items[i].draw(context, program_state, Mat4.translation(this.boundings[i-2].x, this.boundings[i-2].y, this.boundings[i-2].z), this.materials.phong)
                }
          
        }  
        //just for decoration, feel free to delete
        this.shapes.flower.draw(context, program_state, this.flower_trans1, this.materials.phong)  
        this.shapes.flower.draw(context, program_state, this.flower_trans2, this.materials.phong)  
        this.shapes.flower.draw(context, program_state, this.flower_trans3, this.materials.phong)  
        this.shapes.flower.draw(context, program_state, this.flower_trans4, this.materials.phong) 
        this.shapes.flower.draw(context, program_state, this.flower_trans5, this.materials.phong) 
    } 
}